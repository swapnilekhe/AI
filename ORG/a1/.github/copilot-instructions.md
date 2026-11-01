# Project Guidelines

## Code Style
No specific code style preferences defined yet.

## Architecture
Use microservice architecture for component boundaries.

## Build and Test
Commands to install dependencies: npm install

## Conventions
No project-specific conventions that differ from common practices.

## Employee Class
The project includes an `Employee` class defined in [Employee.ts](../Employee.ts) with the following structure:

### Properties
- **FirstName** (string): The first name of the employee
- **LastName** (string): The last name of the employee
- **email** (string): The email address of the employee

### Methods
- **getFullName()**: Returns the full name by concatenating FirstName and LastName
- **displayInfo()**: Logs the employee's full name and email to the console

### Constructor
The class includes a constructor that accepts `firstName`, `lastName`, and `email` parameters to initialize the employee object.