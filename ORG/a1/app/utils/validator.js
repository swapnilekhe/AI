const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+1\d{10}$/;

exports.validateUser = (user) => {
  if (!user || typeof user !== 'object') {
    throw new Error('User payload is required');
  }

  if (!user.name || typeof user.name !== 'string' || user.name.trim() === '') {
    throw new Error('User name is required');
  }

  if (!user.email || typeof user.email !== 'string' || user.email.trim() === '') {
    throw new Error('User email is required');
  }

  if (!emailPattern.test(user.email)) {
    throw new Error('User email must be a valid email address');
  }

  if ('active' in user && typeof user.active !== 'boolean') {
    throw new Error('User active flag must be a boolean');
  }

  if ('phone' in user) {
    if (typeof user.phone !== 'string' || user.phone.trim() === '') {
      throw new Error('User phone number must be a string starting with +1');
    }

    if (!phonePattern.test(user.phone.trim())) {
      throw new Error('User phone number must start with +1 followed by 10 digits');
    }
  }

  const addressFields = ['addressLine1', 'city', 'state', 'postalCode'];
  const hasAddress = addressFields.some((field) => field in user);

  if (hasAddress) {
    if (!user.addressLine1 || typeof user.addressLine1 !== 'string' || user.addressLine1.trim() === '') {
      throw new Error('User address line 1 is required');
    }

    if (!user.city || typeof user.city !== 'string' || user.city.trim() === '') {
      throw new Error('User city is required');
    }

    if (!user.state || typeof user.state !== 'string' || user.state.trim() === '') {
      throw new Error('User state is required');
    }

    if (!user.postalCode || typeof user.postalCode !== 'string' || user.postalCode.trim() === '') {
      throw new Error('User postal code is required');
    }

    const postalPattern = /^\d{5}(-\d{4})?$/;
    if (!postalPattern.test(user.postalCode.trim())) {
      throw new Error('User postal code must be a valid ZIP code like 12345 or 12345-6789');
    }
  }
};
