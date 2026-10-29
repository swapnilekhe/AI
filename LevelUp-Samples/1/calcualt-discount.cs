using System;
using Xunit;

public class DiscountCalculator
{
public decimal CalculateDiscount(decimal totalAmount, decimal discountPercentage)
{
    if (discountPercentage < 0 || discountPercentage > 100)
    {
        throw new ArgumentOutOfRangeException(nameof(discountPercentage), "Discount percentage must be between 0 and 100.");
    }

    decimal discountAmount = (totalAmount * discountPercentage) / 100;
    return totalAmount - discountAmount;
}
}

public class CalculateDiscountTests
{
    private readonly DiscountCalculator _calculator = new();

    [Theory]
    [InlineData(100, 0, 100)]
    [InlineData(100, 100, 0)]
    [InlineData(100, 50, 50)]
    [InlineData(250, 20, 200)]
    [InlineData(0, 25, 0)]
    public void CalculateDiscount_WithValidInputs_ReturnsExpectedTotal(
        decimal totalAmount,
        decimal discountPercentage,
        decimal expected)
    {
        var result = _calculator.CalculateDiscount(totalAmount, discountPercentage);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    public void CalculateDiscount_WithPercentageOutsideBounds_ThrowsArgumentOutOfRangeException(
        decimal discountPercentage)
    {
        var exception = Assert.Throws<ArgumentOutOfRangeException>(
            () => _calculator.CalculateDiscount(100, discountPercentage));

        Assert.Equal("discountPercentage", exception.ParamName);
    }
}
