# -*- coding: utf-8 -*-
{
    'name': 'Persian (Jalali) Date Picker',
    'version': '18.0.5.0.0',
    'category': 'Tools',
    'summary': 'Auto Jalali calendar when language = Persian (fa)',
    'author': 'Custom',
    'depends': ['web'],
    'data': [
        'views/assets.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'persian_date_picker/static/src/js/jalali.js',
            'persian_date_picker/static/src/css/persian_datepicker.css',
            'persian_date_picker/static/src/xml/persian_date_picker.xml',
            'persian_date_picker/static/src/components/persian_date_picker.js',
        ],
    },
    'post_init_hook': 'post_init_hook',
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
