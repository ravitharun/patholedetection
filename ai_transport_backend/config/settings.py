# from pathlib import Path
# import os

# BASE_DIR = Path(__file__).resolve().parent.parent


# # SECURITY
# SECRET_KEY = 'django-insecure-k=d@lpr7tjs^bwtwkh3kbcpp$)+hrbmb=%im%=*jq=vobd_8vt'
# DEBUG = True
# ALLOWED_HOSTS = []


# # INSTALLED APPS
# INSTALLED_APPS = [
#     'django.contrib.admin',
#     'django.contrib.auth',
#     'django.contrib.contenttypes',
#     'django.contrib.sessions',
#     'django.contrib.messages',
#     'django.contrib.staticfiles',

#     'rest_framework',

#     'apps.pothole_detection',
#     'apps.traffic_analysis',
#     'apps.transport_management',
#     'apps.notifications',
# ]


# # MIDDLEWARE
# MIDDLEWARE = [
#     'django.middleware.security.SecurityMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.common.CommonMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     'django.middleware.clickjacking.XFrameOptionsMiddleware',
# ]


# # URL CONFIG
# ROOT_URLCONF = 'config.urls'


# # ✅ TEMPLATE FIX (IMPORTANT)
# TEMPLATES = [
#     {
#         'BACKEND': 'django.template.backends.django.DjangoTemplates',

#         # 🔥 CORRECT PATH
#         'DIRS': [BASE_DIR / 'apps/pothole_detection/templates'],

#         'APP_DIRS': True,
#         'OPTIONS': {
#             'context_processors': [
#                 'django.template.context_processors.request',
#                 'django.contrib.auth.context_processors.auth',
#                 'django.contrib.messages.context_processors.messages',
#             ],
#         },
#     },
# ]


# # WSGI
# WSGI_APPLICATION = 'config.wsgi.application'


# # ✅ MYSQL DATABASE
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'ai_transport',
#         'USER': 'root',
#         'PASSWORD': 'tharun2005',  # 🔥 replace later with env variable
#         'HOST': 'localhost',
#         'PORT': '3306',
#     }
# }


# # PASSWORD VALIDATION
# AUTH_PASSWORD_VALIDATORS = [
#     {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
#     {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
# ]


# # INTERNATIONALIZATION
# LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC'
# USE_I18N = True
# USE_TZ = True


# # STATIC FILES
# STATIC_URL = 'static/'


# # 🔥 MEDIA FILES (IMPORTANT FOR YOUR PROJECT)
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
# MEDIA_URL = '/media/'


# # DEFAULT AUTO FIELD
# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = 'django-insecure-k=d@lpr7tjs^bwtwkh3kbcpp$)+hrbmb=%im%=*jq=vobd_8vt'
DEBUG = True
ALLOWED_HOSTS = []

# INSTALLED APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',

    'corsheaders',  # 🔹 Added for CORS

    'apps.pothole_detection',
    'apps.traffic_analysis',
    'apps.transport_management',
    'apps.notifications',
]

# MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 🔹 MUST be at top for CORS
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL CONFIG
ROOT_URLCONF = 'config.urls'

# TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'apps/pothole_detection/templates'],  # ✅ path fix
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# WSGI
WSGI_APPLICATION = 'config.wsgi.application'

# DATABASE
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ai_transport',
        'USER': 'root',
        'PASSWORD': 'tharun2005',  # 🔹 replace later with env variable
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

# PASSWORD VALIDATION
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# INTERNATIONALIZATION
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# STATIC FILES
STATIC_URL = 'static/'

# MEDIA FILES
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# DEFAULT AUTO FIELD
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# 🔹 CORS CONFIGURATION
# Allow your React frontend to access this API
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # 🔹 frontend origin
]

# OR, for testing only (less secure)
# CORS_ALLOW_ALL_ORIGINS = True

# Optional: allow credentials if needed
# CORS_ALLOW_CREDENTIALS = True