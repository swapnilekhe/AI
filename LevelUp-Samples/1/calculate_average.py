def calculate_average(numbers):
    """
    Calculate the average of a list of numbers.

    Parameters:
    numbers (list): A list of numerical values.

    Returns:
    float: The average of the numbers in the list.
    """
    if not numbers:
        return 0.0  # Return 0 for an empty list to avoid division by zero
    
    total = sum(numbers)
    count = len(numbers)
    average = total / count
    print(f"Total: {total}, Count: {count}, Average: {average}")
    return average

if __name__ == "__main__":
    calculate_average([10, 20, 30, 40, 50])


