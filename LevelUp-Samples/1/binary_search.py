def binary_search(numbers: list[int], target: int) -> int:
    """Return the index of target in a sorted list, or -1 if it is absent."""
    left = 0
    right = len(numbers) - 1

    while left <= right:
        middle = (left + right) // 2
        if numbers[middle] == target:
            return middle
        if numbers[middle] < target:
            left = middle + 1
        else:
            right = middle - 1

    return -1


if __name__ == "__main__":
    values = [10, 20, 30, 40, 50]
    print(binary_search(values, 30))