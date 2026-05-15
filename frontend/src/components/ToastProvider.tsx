import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast functions
export const showToast = {
  success: (message: string, title?: string) => {
    toast.success(
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>
    );
  },
  error: (message: string, title?: string) => {
    toast.error(
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>
    );
  },
  info: (message: string, title?: string) => {
    toast.info(
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>
    );
  },
  warning: (message: string, title?: string) => {
    toast.warn(
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{message}</p>
      </div>
    );
  },
};

// Reminder timer (for time-based notifications)
let reminderInterval: number | null = null;

export function startReminder(callback: () => void, intervalMinutes: number = 10) {
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }

  reminderInterval = window.setInterval(() => {
    callback();
  }, intervalMinutes * 60 * 1000);
}

export function stopReminder() {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}

// Celebration animation for completing puzzle
export function showCelebration() {
  toast.success(
    <div className="text-center">
      <p className="text-2xl">🎉</p>
      <p className="font-semibold">推演完成！</p>
      <p>恭喜您完成本次院感暴发调查演练</p>
    </div>,
    {
      icon: false,
      autoClose: 5000,
    }
  );
}

// ToastProvider component to add to App
export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}