const express = require("express");
const path = require("path");
const app = express();

// Отключить кэширование для всех статических файлов
app.use(
  express.static(path.join(__dirname, ""), {
    setHeaders: (res, path) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    },
  })
);
// Определение маршрута для корневого пути
app.get('/', (req, res) => {
  // Отправка HTML-файла из директории public
  res.sendFile(path.join(__dirname, '', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});