export const canvas = document.querySelector('canvas');
export const c = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 720;

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);
