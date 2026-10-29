#create function to created sales order 
"""Validated customer-order processing with configurable discounts and tax."""

from __future__ import annotations

import logging
import unittest
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from typing import Iterable, Mapping

logger = logging.getLogger(__name__)
CENT = Decimal("0.01")
ZERO = Decimal("0")


class OrderError(ValueError):
    """Base exception for invalid order data or processing configuration."""


def _money(value: Decimal | str | int | float, field: str) -> Decimal:
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise OrderError(f"{field} must be a valid number.") from exc
    if not amount.is_finite():
        raise OrderError(f"{field} must be finite.")
    return amount


@dataclass(frozen=True)
class OrderItem:
    item_name: str
    quantity: int
    unit_price: Decimal

    def __post_init__(self) -> None:
        if not isinstance(self.item_name, str) or not self.item_name.strip():
            raise OrderError("Item name must be a non-empty string.")
        if isinstance(self.quantity, bool) or not isinstance(self.quantity, int) or self.quantity <= 0:
            raise OrderError("Item quantity must be a positive integer.")
        price = _money(self.unit_price, "Unit price")
        if price < ZERO:
            raise OrderError("Unit price cannot be negative.")
        object.__setattr__(self, "unit_price", price)

    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity


@dataclass(frozen=True)
class SalesOrder:
    order_id: str
    customer_name: str
    location: str
    items: tuple[OrderItem, ...]

    def __post_init__(self) -> None:
        for field, value in (("Order ID", self.order_id), ("Customer name", self.customer_name), ("Location", self.location)):
            if not isinstance(value, str) or not value.strip():
                raise OrderError(f"{field} must be a non-empty string.")
        if not self.items or not all(isinstance(item, OrderItem) for item in self.items):
            raise OrderError("An order must contain at least one valid item.")

    @property
    def subtotal(self) -> Decimal:
        return sum((item.subtotal for item in self.items), ZERO)


@dataclass(frozen=True)
class DiscountRule:
    """Percentage discount applied when subtotal meets the minimum."""

    minimum_subtotal: Decimal
    percent: Decimal

    def __post_init__(self) -> None:
        minimum = _money(self.minimum_subtotal, "Minimum subtotal")
        percent = _money(self.percent, "Discount percent")
        if minimum < ZERO or not ZERO <= percent <= Decimal("100"):
            raise OrderError("Discount minimum must be non-negative and percent between 0 and 100.")
        object.__setattr__(self, "minimum_subtotal", minimum)
        object.__setattr__(self, "percent", percent)


@dataclass(frozen=True)
class OrderTotal:
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total: Decimal


class OrderProcessor:
    """Calculates totals using explicitly configured location tax rates."""

    def __init__(self, tax_rates: Mapping[str, Decimal | str | int | float], discounts: Iterable[DiscountRule] = ()) -> None:
        self.tax_rates = {location: _money(rate, f"Tax rate for {location}") for location, rate in tax_rates.items()}
        if any(not isinstance(location, str) or not location.strip() for location in self.tax_rates):
            raise OrderError("Tax-rate locations must be non-empty strings.")
        if any(rate < ZERO or rate > Decimal("1") for rate in self.tax_rates.values()):
            raise OrderError("Tax rates must be between 0 and 1 (inclusive).")
        self.discounts = tuple(sorted(discounts, key=lambda rule: rule.minimum_subtotal))
        if not all(isinstance(rule, DiscountRule) for rule in self.discounts):
            raise OrderError("Discounts must contain DiscountRule instances.")

    def calculate_total(self, order: SalesOrder) -> OrderTotal:
        try:
            if not isinstance(order, SalesOrder):
                raise OrderError("order must be a SalesOrder.")
            if order.location not in self.tax_rates:
                raise OrderError(f"No tax rate configured for location {order.location!r}.")
            subtotal = order.subtotal
            applicable = [rule for rule in self.discounts if subtotal >= rule.minimum_subtotal]
            discount = (subtotal * applicable[-1].percent / Decimal("100")) if applicable else ZERO
            taxable = subtotal - discount
            tax = (taxable * self.tax_rates[order.location]).quantize(CENT, rounding=ROUND_HALF_UP)
            total = (taxable + tax).quantize(CENT, rounding=ROUND_HALF_UP)
            result = OrderTotal(subtotal.quantize(CENT, rounding=ROUND_HALF_UP), discount.quantize(CENT, rounding=ROUND_HALF_UP), tax, total)
            logger.info("Processed order %s; total=%s", order.order_id, result.total)
            return result
        except OrderError:
            logger.exception("Unable to process order")
            raise


def create_sales_order(order_id: str, customer_name: str, items: list[dict[str, object]], location: str = "default") -> dict[str, object]:
    """Create an order from dictionaries containing item_name, quantity, unit_price."""
    try:
        if not isinstance(items, list):
            raise OrderError("Items must be a list.")
        parsed_items = tuple(
            OrderItem(
                item_name=item["item_name"],
                quantity=item["quantity"],
                unit_price=_money(item["unit_price"], "Unit price"),
            )
            for item in items
            if isinstance(item, dict)
        )
        if len(parsed_items) != len(items):
            raise OrderError("Every item must be a dictionary.")
        order = SalesOrder(order_id, customer_name, location, parsed_items)
        return {"order_id": order.order_id, "customer_name": order.customer_name,
                "location": order.location,
                "items": [{"item_name": item.item_name, "quantity": item.quantity,
                           "unit_price": str(item.unit_price)} for item in order.items],
                "status": "created"}
    except (KeyError, TypeError, OrderError) as exc:
        logger.exception("Invalid sales order")
        if isinstance(exc, OrderError):
            raise
        raise OrderError("Each item requires item_name, quantity, and unit_price.") from exc


class OrderProcessorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.processor = OrderProcessor(
            {"US-CA": "0.0825"}, [DiscountRule(Decimal("100"), Decimal("10"))]
        )
        self.order = SalesOrder("A-1", "Customer", "US-CA", (OrderItem("Book", 2, Decimal("60")),))

    def test_discount_and_tax(self) -> None:
        result = self.processor.calculate_total(self.order)
        self.assertEqual(result.discount, Decimal("12.00"))
        self.assertEqual(result.tax, Decimal("8.91"))
        self.assertEqual(result.total, Decimal("116.91"))

    def test_unknown_location_fails(self) -> None:
        order = SalesOrder("A-2", "Customer", "unknown", (OrderItem("Book", 1, Decimal("10")),))
        with self.assertRaises(OrderError):
            self.processor.calculate_total(order)

    def test_invalid_quantity_fails(self) -> None:
        with self.assertRaises(OrderError):
            OrderItem("Book", 0, Decimal("10"))


if __name__ == "__main__":
    unittest.main()
    