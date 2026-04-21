from setuptools import find_packages, setup

with open("requirements.txt") as f:
    install_requires = f.read().strip().split("\n")

# get version from __version__ variable in shipping_logistics/__init__.py
from shipping_logistics import __version__ as version

setup(
    name="shipping_logistics",
    version=version,
    description="Log transportation of packages handed off to shipping providers.",
    author="Nathaniel",
    author_email="admin@example.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires,
)
