import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from '../Timer';

describe('Timer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial time as 00:00', () => {
    render(<Timer />);
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('displays pause button initially', () => {
    render(<Timer />);
    expect(screen.getByRole('button', { name: '暂停' })).toBeInTheDocument();
  });

  it('increments time every second', async () => {
    render(<Timer />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:01')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText('00:06')).toBeInTheDocument();
  });

  it('shows warning color after 25 minutes', async () => {
    render(<Timer />);

    await act(async () => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toHaveClass('text-red-500');
  });

  it('toggles between pause and resume', async () => {
    render(<Timer />);

    const button = screen.getByRole('button', { name: '暂停' });
    await act(async () => {
      fireEvent.click(button);
    });

    expect(screen.getByRole('button', { name: '继续' })).toBeInTheDocument();
  });

  it('pauses timer when pause is clicked', async () => {
    render(<Timer />);

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('00:03')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: '暂停' });
    await act(async () => {
      fireEvent.click(button);
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('00:03')).toBeInTheDocument();
  });

  it('resumes timer when resume is clicked', async () => {
    render(<Timer />);

    const pauseButton = screen.getByRole('button', { name: '暂停' });
    await act(async () => {
      fireEvent.click(pauseButton);
    });

    const resumeButton = screen.getByRole('button', { name: '继续' });
    await act(async () => {
      fireEvent.click(resumeButton);
    });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('00:03')).toBeInTheDocument();
  });
});