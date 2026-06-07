import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true, state: { openProfile: true } });
  }, [navigate]);

  return null;
}
