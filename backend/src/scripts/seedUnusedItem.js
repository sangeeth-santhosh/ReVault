import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import { cloudinary, cloudinaryUploadOptions } from '../config/cloudinary.js';

const USED_ITEMS = [
  {
    title: 'Used Running Shoes - Mixed Sizes',
    description: 'Pre-owned running shoes collected from retail returns. Structurally intact with visible wear, suitable for secondary resale and reuse.',
    category: 'other',
    quantity: 64,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/On_Cloud_Running_Shoes.jpg',
  },
  {
    title: 'Used Corrugated Cardboard Boxes',
    description: 'Flattened used shipping cartons with minor creases. Useful for repacking, storage, and logistics reuse operations.',
    category: 'packaging',
    quantity: 420,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/EFTA00002256_-_Stacked_cardboard_boxes_fill_the_corner_of_a_warehouse_room_with_white_doors_and_an_exit_sign_above.jpg',
  },
  {
    title: 'Used Football Training Balls',
    description: 'Used synthetic footballs from academy training cycles. Surface scuffs present; air retention tested before listing.',
    category: 'other',
    quantity: 38,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Just_a_soccer_ball_%2834782492153%29.jpg',
  },
  {
    title: 'Used Cricket Bats (Practice Grade)',
    description: 'Practice-grade wooden cricket bats with cosmetic marks and edge wear from training sessions.',
    category: 'other',
    quantity: 22,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Cricket_equipment_at_Sandwich_Town_CC_in_Sandwich%2C_Kent%2C_England.jpg',
  },
  {
    title: 'Used PET Bottles - Cleaned Batch',
    description: 'Sorted and cleaned PET bottles from beverage operations, ready for recycling or industrial repurposing.',
    category: 'packaging',
    quantity: 1500,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Bales_of_PET_bottles_closeup.jpg',
  },
  {
    title: 'Used Glass Bottles - Assorted',
    description: 'Assorted used glass bottles, rinsed and stored in crates. Suitable for recycling and non-food repurpose use.',
    category: 'packaging',
    quantity: 560,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/IKEA_store%2C_Glassware%2C_Glass_bottles%2C_Rostov-on-Don%2C_Russia.jpg/1280px-IKEA_store%2C_Glassware%2C_Glass_bottles%2C_Rostov-on-Don%2C_Russia.jpg',
  },
  {
    title: 'Used Office Chairs - Refurb Lot',
    description: 'Used office chairs from workspace downsizing. Wheels and lifts vary by unit; ideal for refurb and resale.',
    category: 'other',
    quantity: 47,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Buerostuhl_%28fcm%29.jpg',
  },
  {
    title: 'Used Plastic Crates (Stackable)',
    description: 'Durable used stackable crates with minor abrasion marks. Commonly used in internal logistics and sorting lines.',
    category: 'packaging',
    quantity: 210,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Orange_plastic_storage_crate_at_7-Eleven.jpg',
  },
  {
    title: 'Used Keyboard Units (Office Pullout)',
    description: 'Pulled-out used computer keyboards from office refresh cycles. Functional but cosmetically worn.',
    category: 'electronics',
    quantity: 95,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/QWERTY_keyboard.jpg',
  },
  {
    title: 'Used Wooden Pallets - Standard Size',
    description: 'Standard-size used wooden pallets with expected handling wear. Suitable for non-food warehouse movement and storage.',
    category: 'packaging',
    quantity: 130,
    unit: 'pieces',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Wooden-pallets_stacked_4.jpg/1280px-Wooden-pallets_stacked_4.jpg',
  },
];

const pickOwner = async () => {
  const owner = await User.findOne({ role: 'user', status: 'approved' }).sort({ createdAt: 1 });
  if (!owner) {
    throw new Error('No approved user found. Create/approve at least one business user first.');
  }
  return owner;
};

const makeExpiryDate = (monthsAhead = 6) => {
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + monthsAhead);
  expiryDate.setHours(0, 0, 0, 0);
  return expiryDate;
};

const uploadBufferToCloudinary = (buffer, index) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...cloudinaryUploadOptions,
        public_id: `unused-seed-${Date.now()}-${index}`,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result?.secure_url || null);
      }
    );
    stream.end(buffer);
  });

const fetchImageBuffer = async (url) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ReVault-SeedScript/1.0',
      Accept: 'image/*,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
};

const uploadImageFromWeb = async (imageUrl, index) => {
  try {
    const direct = await cloudinary.uploader.upload(imageUrl, {
      ...cloudinaryUploadOptions,
      public_id: `unused-seed-${Date.now()}-${index}`,
    });
    if (direct?.secure_url) return direct.secure_url;
  } catch {
    // fallback below
  }

  const buffer = await fetchImageBuffer(imageUrl);
  return uploadBufferToCloudinary(buffer, index);
};

const uploadSingleImageToCloudinary = async (imageUrl, index) => {
  try {
    const secureUrl = await uploadImageFromWeb(imageUrl, index);
    if (!secureUrl) {
      throw new Error('No secure_url returned');
    }
    return secureUrl;
  } catch (err) {
    throw new Error(`Image upload failed for ${imageUrl}: ${err?.message || 'unknown error'}`);
  }
};

const run = async () => {
  await connectDB();

  const owner = await pickOwner();
  const locationParts = [owner?.address?.city, owner?.address?.state].filter(Boolean);

  const createdItems = [];
  let updatedItems = 0;

  for (let index = 0; index < USED_ITEMS.length; index += 1) {
    const itemDef = USED_ITEMS[index];

    const existing = await Inventory.findOne({
      owner: owner._id,
      title: itemDef.title,
      condition: 'used',
    }).select('_id title');

    const secureImageUrl = await uploadSingleImageToCloudinary(itemDef.imageUrl, index + 1);
    const expiryDate = makeExpiryDate(8);

    if (existing) {
      await Inventory.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: itemDef.title,
            title: itemDef.title,
            description: itemDef.description,
            category: itemDef.category,
            quantity: itemDef.quantity,
            unit: itemDef.unit,
            condition: 'used',
            location: locationParts.join(', ') || 'Warehouse Zone A',
            expiryDate,
            expiry: expiryDate.toISOString().slice(0, 10),
            images: [secureImageUrl],
            status: 'available',
          },
        }
      );

      updatedItems += 1;
      console.log(`♻️  Refreshed existing item ${index + 1}/10: ${itemDef.title}`);
      continue;
    }

    const item = await Inventory.create({
      owner: owner._id,
      name: itemDef.title,
      title: itemDef.title,
      description: itemDef.description,
      category: itemDef.category,
      quantity: itemDef.quantity,
      unit: itemDef.unit,
      condition: 'used',
      location: locationParts.join(', ') || 'Warehouse Zone A',
      expiryDate,
      expiry: expiryDate.toISOString().slice(0, 10),
      images: [secureImageUrl],
      status: 'available',
    });

    createdItems.push(item);
    console.log(`✅ Created used item ${index + 1}/10: ${item.title}`);
  }

  console.log('✅ Used items batch processed successfully');
  console.log(`   Total items created: ${createdItems.length}`);
  console.log(`   Total items refreshed (already existed): ${updatedItems}`);
  console.log(`   Owner: ${owner.businessName || owner.name} (${owner.email})`);
  if (createdItems.length) {
    console.log(`   Last Item ID: ${createdItems[createdItems.length - 1]?._id}`);
  }

  await disconnectDB();
};

run().catch(async (err) => {
  console.error('❌ seedUnusedItem failed', err.message || err);
  try {
    await disconnectDB();
  } catch {
    // ignore
  }
  process.exit(1);
});
