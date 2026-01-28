FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install zip pdo_mysql

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Generate app key
RUN php artisan key:generate

# Set default environment variables
ENV DB_CONNECTION=mysql
ENV DB_HOST=arabic-web.railway.internal
ENV DB_PORT=3306
ENV DB_DATABASE=railway
ENV DB_USERNAME=root
ENV DB_PASSWORD=vHFzsyGAueEHcvXTSVbgqDgCDhQENOIU
ENV APP_ENV=production
ENV APP_DEBUG=false

# Expose port
EXPOSE 10000

# Start Laravel
CMD sh -c "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000"
