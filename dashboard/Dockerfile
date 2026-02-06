FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```


### **7. Variable de entorno**
Crear `dashboard/.env`:
```
DATABASE_URL=postgresql://app_client:secure_password@db:5432/postgres