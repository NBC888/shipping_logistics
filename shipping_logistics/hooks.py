app_name = "shipping_logistics"
app_title = "Shipping Logistics"
app_publisher = "Nathaniel"
app_description = "Log transportation of packages handed off to shipping providers."
app_email = "admin@example.com"
app_license = "MIT"

# Scheduler
# ---------

scheduler_events = {
    "daily": [
        "shipping_logistics.shipping_logistics.doctype.package_transport.package_transport.mark_overdue_transports",
    ],
}
