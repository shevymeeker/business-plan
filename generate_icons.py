#!/usr/bin/env python3
"""
Simple PNG icon generator without external dependencies
Creates basic colored square icons for PWA
"""
import struct
import zlib

def create_png(width, height, bg_color):
    """Create a simple PNG file with a solid background color"""

    # PNG signature
    png_signature = b'\x89PNG\r\n\x1a\n'

    # Create IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_chunk = create_chunk(b'IHDR', ihdr_data)

    # Create image data (RGB pixels)
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # Filter type: None
        for x in range(width):
            # Determine color based on position (create simple design)
            if y < height // 4:  # Top stripe
                r, g, b = 52, 152, 219  # Blue
            elif height // 3 <= y <= height * 2 // 3 and width // 4 <= x <= width * 3 // 4:
                # Center area - darker
                r, g, b = 44, 62, 80  # Dark blue
            else:
                r, g, b = bg_color  # Background color

            raw_data += bytes([r, g, b])

    # Compress image data
    compressed_data = zlib.compress(raw_data, 9)
    idat_chunk = create_chunk(b'IDAT', compressed_data)

    # Create IEND chunk
    iend_chunk = create_chunk(b'IEND', b'')

    # Combine all chunks
    png_data = png_signature + ihdr_chunk + idat_chunk + iend_chunk

    return png_data

def create_chunk(chunk_type, data):
    """Create a PNG chunk with CRC"""
    length = struct.pack('>I', len(data))
    crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
    return length + chunk_type + data + crc

# Generate 192x192 icon
bg_color = (44, 62, 80)  # Dark blue-gray
icon_192 = create_png(192, 192, bg_color)
with open('docs/icon-192.png', 'wb') as f:
    f.write(icon_192)

print("Created docs/icon-192.png")

# Generate 512x512 icon
icon_512 = create_png(512, 512, bg_color)
with open('docs/icon-512.png', 'wb') as f:
    f.write(icon_512)

print("Created docs/icon-512.png")
print("Icons generated successfully!")
