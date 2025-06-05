import '../styles/toast.css';

export const Toast = {
  success: (msg) => {
    const el = document.createElement('div');
    el.className = 'toast toast-success';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
      el.classList.add('visible');
    }, 10);
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => document.body.removeChild(el), 300);
    }, 3000);
  },
  error: (msg) => {
    const el = document.createElement('div');
    el.className = 'toast toast-error';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
      el.classList.add('visible');
    }, 10);
    setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => document.body.removeChild(el), 300);
    }, 3000);
  }
};