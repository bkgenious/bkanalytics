
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import Button from './Button';

describe('Button', () => {
    it('should have no accessibility violations', async () => {
        const { container } = render(<Button>Accessible Button</Button>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('renders children correctly', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('handles onClick events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);

        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders disabled state', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByText('Disabled').closest('button')).toBeDisabled();
    });

    it('renders loading state', () => {
        render(<Button loading>Loading</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
        // Check for spinner part (circle/path)
        expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });

    it('applies variant classes', () => {
        render(<Button variant="danger">Delete</Button>);
        expect(screen.getByText('Delete').closest('button')).toHaveClass('btn-danger');
    });
});
