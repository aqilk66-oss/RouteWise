import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <PublicLayout>
      <div className="py-24 sm:py-32 flex items-center justify-center">
        <Container className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-blue mx-auto flex items-center justify-center mb-6 shadow-soft">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight mb-2">404</h1>
          <h2 className="text-xl font-bold text-brand-navy mb-3">Route Not Found</h2>
          <p className="text-sm text-brand-slate mb-8 leading-relaxed">
            The page or transport coordinate you are looking for has been moved, rescheduled, or does not exist on our route map.
          </p>
          <Link to="/">
            <Button variant="primary" size="md" icon={Home}>
              Return to RouteWise Home
            </Button>
          </Link>
        </Container>
      </div>
    </PublicLayout>
  );
};

export default NotFoundPage;
