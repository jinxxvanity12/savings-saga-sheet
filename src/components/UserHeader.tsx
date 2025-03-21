
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import UserMenuHeader from './UserMenuHeader';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const UserHeader = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (currentUser) {
    return <UserMenuHeader />;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLoginClick}
      className="ml-auto"
    >
      <LogIn className="h-4 w-4 mr-2" />
      Sign In
    </Button>
  );
};

export default UserHeader;
