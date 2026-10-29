import unittest


class TestCalculateAverage(unittest.TestCase):
    def test_average_of_integers(self):
        self.assertEqual(calculate_average([10, 20, 30, 40, 50]), 30.0)

    def test_empty_list_returns_zero(self):
        self.assertEqual(calculate_average([]), 0.0)

    def test_average_of_decimal_numbers(self):
        self.assertAlmostEqual(calculate_average([1.5, 2.5, 3.0]), 7.0 / 3)


if __name__ == "__main__":
    unittest.main()
