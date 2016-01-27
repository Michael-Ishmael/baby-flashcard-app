from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url, patterns
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from . import views

# urlpatterns = staticfiles_urlpatterns()
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^processimage/(?P<image_id>[0-9]+)/$', views.processImage, name='processimage'),
]

urlpatterns += patterns('',
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.MEDIA_ROOT,
    }),
)