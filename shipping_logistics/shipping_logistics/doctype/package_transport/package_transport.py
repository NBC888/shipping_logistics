import frappe
from frappe.model.document import Document
from frappe.utils import getdate, today


class PackageTransport(Document):
    def before_insert(self):
        if not self.creation_date:
            self.creation_date = today()

        # Initial status: if scheduled but transport date is already past, mark Overdue.
        if not self.status or self.status == "Scheduled":
            if self.transport_date and getdate(self.transport_date) < getdate(today()):
                self.status = "Overdue"
            else:
                self.status = "Scheduled"

    def validate(self):
        self.total_packages = (
            (self.express_packages or 0)
            + (self.international_packages or 0)
            + (self.us_packages or 0)
            + (self.canadian_packages or 0)
        )
        self._validate_supplier_is_shipping_provider()
        self._sync_departing_address_from_driver()

    def _validate_supplier_is_shipping_provider(self):
        if not self.shipping_provider:
            return
        group = frappe.db.get_value("Supplier", self.shipping_provider, "supplier_group")
        if group != "Shipping Provider":
            frappe.throw(
                f"Supplier {self.shipping_provider} is not in Supplier Group 'Shipping Provider'."
            )

    def _sync_departing_address_from_driver(self):
        if self.driver and not self.departing_address:
            addr = frappe.db.get_value("Driver", self.driver, "address")
            if addr:
                self.departing_address = addr


def mark_overdue_transports():
    """Daily scheduler job: flip Scheduled records whose transport date has passed to Overdue."""
    frappe.db.sql(
        """
        UPDATE `tabPackage Transport`
        SET status = 'Overdue', modified = %s, modified_by = %s
        WHERE status = 'Scheduled'
          AND transport_date < %s
        """,
        (frappe.utils.now(), "Administrator", today()),
    )
    frappe.db.commit()
