class Employee {
  FirstName: string;
  LastName: string;
  email: string;

  constructor(firstName: string, lastName: string, email: string) {
    this.FirstName = firstName;
    this.LastName = lastName;
    this.email = email;
  }

  getFullName(): string {
    return `${this.FirstName} ${this.LastName}`;
  }

  displayInfo(): void {
    console.log(`Name: ${this.getFullName()}, Email: ${this.email}`);
  }
}

export default Employee;
