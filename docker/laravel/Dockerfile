FROM php:8.1-cli
WORKDIR /var/www/backend

# Install system deps for Laravel basics
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    curl \
    libzip-dev \
    libonig-dev \
    zlib1g-dev \
  && docker-php-ext-install zip pdo pdo_mysql mbstring bcmath \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

EXPOSE 8000

CMD ["sh", "-c", "composer install --no-interaction || true && php artisan serve --host=0.0.0.0 --port=8000"]
