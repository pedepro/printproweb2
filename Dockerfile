# Use uma imagem base do NGINX
FROM nginx:alpine

# Copie o arquivo HTML para o diretório padrão do NGINX
COPY index.html /usr/share/nginx/html/

# Exponha a porta padrão do NGINX
EXPOSE 80

# Inicie o NGINX quando o container for iniciado
CMD ["nginx", "-g", "daemon off;"]
