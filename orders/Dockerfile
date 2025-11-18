# Define a imagem base, uma versão específica do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do container (onde sua aplicação vai ficar)
WORKDIR /app

# Copia os arquivos package.json e package-lock.json (que contêm as dependências)
# e instala essas dependências. Isso economiza tempo se os arquivos de dependência não mudarem.
COPY package*.json ./
RUN npm install

# Copia o restante do código da sua aplicação para o container
COPY . .

# Informa ao Docker que a aplicação dentro deste container vai usar a porta 4002
EXPOSE 4002

# Define o comando que será executado quando o container iniciar para rodar sua aplicação
CMD ["npm", "start"]