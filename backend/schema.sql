CREATE DATABASE IF NOT EXISTS hotel_booking;
USE hotel_booking;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'user') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20),
  room_type VARCHAR(50),
  price DECIMAL(10,2),
  status ENUM('available','booked') DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  room_id INT,
  check_in DATE,
  check_out DATE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- sample admin (password: admin123 hashed)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@hotel.com', '$2b$10$Z3Y0OXvGyffx0QvZ5MIxLejI3oNfyJNUFiQFxmM20oYt3yqVu6g7O', 'admin');

INSERT INTO rooms (room_number, room_type, price) VALUES
('101','Single',2500.00),
('102','Double',4000.00),
('201','Deluxe',7000.00);
