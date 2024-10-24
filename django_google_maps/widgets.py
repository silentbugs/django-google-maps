from django.conf import settings
from django.forms import widgets


class BaseGoogleMapsAddressWidget(widgets.TextInput):
    class Media:
        css = {
            'all': ['django_google_maps/css/google-maps-admin.css']
        }
        js = [
            'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js',
            'https://maps.google.com/maps/api/js?key={}&libraries=places'.format(
                settings.GOOGLE_MAPS_API_KEY
            ),
            'django_google_maps/js/google-maps-admin-base.js',
        ]


class GoogleMapsAddressWidget(BaseGoogleMapsAddressWidget):
    """a widget that will place a google map right after the #id_address field"""
    template_name = "django_google_maps/widgets/map_widget.html"

    class Media:
        js = BaseGoogleMapsAddressWidget.Media.js + [
            'django_google_maps/js/google-maps-admin.js',
        ]


class GoogleMapsAddressInlineWidget(BaseGoogleMapsAddressWidget):
    """
    a widget that will place a google map right after the #id_locations-{index}-address
    field and give it unique identifier.
    """
    template_name = 'django_google_maps/widgets/map_widget_inline.html'

    class Media:
        js = BaseGoogleMapsAddressWidget.Media.js + [
            'django_google_maps/js/google-maps-admin-inline.js',
        ]
