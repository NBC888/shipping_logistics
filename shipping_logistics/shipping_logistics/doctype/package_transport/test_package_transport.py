import unittest

import frappe
from frappe.utils import add_days, today


class TestPackageTransport(unittest.TestCase):
    def tearDown(self):
        frappe.db.rollback()

    def test_status_becomes_overdue_on_insert_when_transport_date_past(self):
        doc = frappe.new_doc("Package Transport")
        doc.transport_date = add_days(today(), -2)
        # Populate just enough to exercise before_insert; skip real validation
        # by running it in isolation.
        doc.before_insert()
        self.assertEqual(doc.shipment_status, "Overdue")
        self.assertEqual(doc.creation_date, today())

    def test_status_stays_scheduled_when_transport_date_future(self):
        doc = frappe.new_doc("Package Transport")
        doc.transport_date = add_days(today(), 3)
        doc.before_insert()
        self.assertEqual(doc.shipment_status, "Scheduled")

    def test_total_packages_is_sum(self):
        doc = frappe.new_doc("Package Transport")
        doc.express_packages = 2
        doc.international_packages = 3
        doc.us_packages = 5
        doc.canadian_packages = 7
        # Bypass supplier / driver validation branches by leaving them unset.
        doc.validate()
        self.assertEqual(doc.total_packages, 17)
