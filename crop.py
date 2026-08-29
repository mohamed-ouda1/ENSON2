from PIL import Image

# Open the source image
img = Image.open('التصميم المتحرك.jpg')

# Crop coordinates for the house
# Left, Upper, Right, Lower
box = (515, 20, 655, 140)
cropped = img.crop(box)

# Save the cropped image
cropped.save('house.png')
print("Cropped successfully!")
