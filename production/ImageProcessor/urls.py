from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import url, patterns
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.decorators.csrf import csrf_exempt
from . import views

# urlpatterns = staticfiles_urlpatterns()
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^updatecard', csrf_exempt(views.update_card), name='update_card'),
    url(r'^update', csrf_exempt(views.update_image_data), name='update'),
    url(r'^resources', csrf_exempt(views.resources), name='resources'),

]

urlpatterns += patterns('',
    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.MEDIA_ROOT,
    }),
)