import { v4 as uuidv4 } from 'uuid'; // Import the `v4` method from `uuid`

// Register function
const register = async (email: string, password: string, name: string) => {
  try {
    setIsLoading(true);

    // This is a mock implementation for demo purposes
    // In a real app, this would call an API endpoint

    // Simple validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Get existing users or initialize empty array
    const usersStr = localStorage.getItem('budgetTrackerUsers') || '[]';
    const users = JSON.parse(usersStr);

    // Check if user already exists
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    // Create new user using uuidv4
    const newUser = {
      id: uuidv4(), // Use uuidv4 instead of crypto.randomUUID
      email,
      password, // In a real app, NEVER store plain text passwords
      name,
      createdAt: new Date().toISOString()
    };

    // Save to "database" (localStorage)
    users.push(newUser);
    localStorage.setItem('budgetTrackerUsers', JSON.stringify(users));

    // Remove password before storing in state/localStorage
    const { password: _, ...userWithoutPassword } = newUser;

    // Update state and localStorage for current user
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('budgetTrackerUser', JSON.stringify(userWithoutPassword));

    toast.success('Registration successful');
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Registration failed');
    throw error;
  } finally {
    setIsLoading(false);
  }
};
