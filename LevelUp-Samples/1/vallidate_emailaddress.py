# Validate Email Address
# write the robust code to validate email address using regex in python
import re   
import unittest

def validate_email(email):
    if not isinstance(email, str):
        return False
    pattern = r'[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}'
    return re.fullmatch(pattern, email) is not None


class TestValidateEmail(unittest.TestCase):
    def test_valid_addresses(self):
        for email in (
            "user@example.com",
            "first.last+tag@sub.example.org",
            "user_name-1%tag@example-domain.co",
        ):
            with self.subTest(email=email):
                self.assertTrue(validate_email(email))

    def test_invalid_addresses(self):
        for email in (
            "",
            "plain-address",
            "user@",
            "@example.com",
            "user@example",
            " user@example.com",
            "user@example.com ",
            ".user@example.com",
            "user..name@example.com",
            "user.@example.com",
            "user@.example.com",
            "user@example..com",
            "user@-example.com",
            "user@example-.com",
            "user@example.c",
        ):
            with self.subTest(email=email):
                self.assertFalse(validate_email(email))

    def test_non_string_values(self):
        for email in (None, 42):
            with self.subTest(email=email):
                self.assertFalse(validate_email(email))


if __name__ == "__main__":
    unittest.main()
