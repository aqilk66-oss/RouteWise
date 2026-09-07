import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from '../../components/ui/Loader';

describe('RouteWise Professional Loader Component', () => {
  it('should render the inline variant with text correctly', () => {
    render(<Loader variant="inline" text="Syncing fleet coordinates..." />);
    expect(screen.getByText('Syncing fleet coordinates...')).toBeInTheDocument();
  });

  it('should render the full-page variant with RouteWise branding', () => {
    render(<Loader variant="page" text="Authenticating RouteWise session..." />);
    expect(screen.getByText('Authenticating RouteWise session...')).toBeInTheDocument();
    expect(screen.getByText('RouteWise')).toBeInTheDocument();
    expect(screen.getByText('Transit')).toBeInTheDocument();
  });

  it('should render the button variant when performing asynchronous submissions', () => {
    const { container } = render(<Loader variant="button" text="Saving..." />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
