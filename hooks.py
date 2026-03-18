# -*- coding: utf-8 -*-
"""
Post-install / post-upgrade hook:
Deletes all cached asset bundle attachments so Odoo is forced to
recompile JS/CSS on the next request. This ensures the new Jalali
widget JS is always served fresh after an upgrade.
"""


def post_init_hook(env):
    _clear_assets(env)


def post_load():
    pass


def uninstall_hook(env):
    pass


def _clear_assets(env):
    env['ir.attachment'].sudo().search([
        ('url', 'like', '/web/assets/%'),
    ]).unlink()
    env.cr.commit()
