const DRIVER_DETAILS_METHOD =
    "shipping_logistics.shipping_logistics.doctype.package_transport.package_transport.get_driver_details";

function load_driver_details(frm) {
    if (!frm.doc.driver) {
        frm.doc.__driver_supplier = null;
        return Promise.resolve({});
    }
    return frappe
        .call({
            method: DRIVER_DETAILS_METHOD,
            args: { driver: frm.doc.driver },
        })
        .then((r) => {
            const data = (r && r.message) || {};
            frm.doc.__driver_supplier = data.supplier || null;
            return data;
        });
}

frappe.ui.form.on("Package Transport", {
    setup(frm) {
        // Restrict Shipping Provider picker to suppliers in the "Shipping Provider" Supplier Group.
        frm.set_query("shipping_provider", () => ({
            filters: { supplier_group: "Shipping Provider" },
        }));

        // Restrict Shipping Provider Address picker to addresses linked to the selected supplier.
        frm.set_query("shipping_provider_address", () => {
            if (!frm.doc.shipping_provider) {
                return { filters: { name: ["in", []] } };
            }
            return {
                query: "frappe.contacts.doctype.address.address.address_query",
                filters: {
                    link_doctype: "Supplier",
                    link_name: frm.doc.shipping_provider,
                },
            };
        });

        // Narrow the driver invoice picker to the Driver's linked Supplier when known.
        frm.set_query("driver_invoice", () => {
            const filters = { docstatus: ["!=", 2] };
            if (frm.doc.__driver_supplier) {
                filters.supplier = frm.doc.__driver_supplier;
            }
            return { filters };
        });
    },

    refresh(frm) {
        // Cache the driver's linked Supplier for the driver_invoice query on form load.
        if (frm.doc.driver && !frm.doc.__driver_supplier) {
            load_driver_details(frm);
        }
    },

    driver(frm) {
        if (!frm.doc.driver) {
            frm.set_value("departing_address", null);
            frm.doc.__driver_supplier = null;
            return;
        }
        load_driver_details(frm).then((data) => {
            frm.set_value("departing_address", data.address || null);
        });
    },

    shipping_provider(frm) {
        // Clear the dependent address whenever the supplier changes.
        frm.set_value("shipping_provider_address", null);
    },
});
