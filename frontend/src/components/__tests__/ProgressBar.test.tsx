import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct props', () => {
    render(<ProgressBar completed={3} total={10} />);

    expect(screen.getByText('推演进度')).toBeInTheDocument();
    expect(screen.getByText('3 / 10 线索')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    const { container } = render(<ProgressBar completed={5} total={10} />);
    const progressBar = container.querySelector('.bg-blue-600');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('handles zero total', () => {
    const { container } = render(<ProgressBar completed={0} total={0} />);
    const progressBar = container.querySelector('.bg-blue-600');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('shows 100% when completed equals total', () => {
    const { container } = render(<ProgressBar completed={10} total={10} />);
    const progressBar = container.querySelector('.bg-blue-600');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });
});