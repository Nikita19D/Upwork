import qrcode

def generate_qr(url, file_path="qrcode.png", format="PNG"):
    """
    Generates a QR code from the given URL and saves it as an image.
    
    :param url: The URL to encode in the QR code.
    :param file_path: The path where the QR code image will be saved.
    :param format: The format of the saved image (PNG, JPG, or SVG).
    """
    qr = qrcode.QRCode(
        version=5,  # Controls the size of the QR code
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill="black", back_color="white")
    
    if format.upper() == "SVG":
        img.save(file_path.replace(".png", ".svg"))
    else:
        img.convert("RGB").save(file_path, format=format.upper())

    print(f"QR Code saved as {file_path}")

# Example usage
generate_qr("https://youtube.com", "qrcode.png", "PNG")
