# Resmi Node.js imajını kullan
FROM node:20

# Çalışma dizinini belirle
WORKDIR /app

# Bağımlılıkları yüklemek için package.json ve package-lock.json'ı kopyala
COPY package*.json ./

# Bağımlılıkları yükle (production için sadece --only=production kullanabilirsin)
RUN npm install

# Tüm kodu kopyala
COPY . .

# Uygulamayı başlat
CMD ["npm", "start"]

