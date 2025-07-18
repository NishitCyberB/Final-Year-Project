const Hotel = require('../models/hotel');

// 🔍 Search Hotels with filters, pagination, and image formatting
exports.searchHotels = async (req, res) => {
  try {
    const { location, category, priceRange, amenities, rating, page = 1, limit = 6 } = req.query;

    const filter = {};

    if (location) {
      filter['location.district'] = new RegExp(location, 'i');
    }

    if (category) {
      filter.category = new RegExp(category, 'i');  
    }

    if (priceRange) {
      if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-').map(Number);
        filter.price = { $gte: min, $lte: max };
      } else {
        filter.price = { $gte: Number(priceRange) };
      }
    }

    if (amenities) {
      filter.amenities = { $in: [new RegExp(amenities, 'i')] };
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    const hotels = await Hotel.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ rating: -1 });

    const totalCount = await Hotel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const hotelsWithImageUrls = hotels.map((hotel) => {
      let imageUrl = null;

      if (hotel.image) {
        if (hotel.image.$binary?.base64) {
          imageUrl = `data:image/jpeg;base64,${hotel.image.$binary.base64}`;
        } else if (hotel.image.data && Buffer.isBuffer(hotel.image.data)) {
          const base64 = hotel.image.data.toString('base64');
          const contentType = hotel.image.contentType || 'image/jpeg';
          imageUrl = `data:${contentType};base64,${base64}`;
        } else if (Buffer.isBuffer(hotel.image)) {
          const base64 = hotel.image.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        } else if (hotel.image.buffer) {
          const base64 = hotel.image.buffer.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        }
      }

      return {
        _id: hotel._id,
        name: hotel.name,
        description: hotel.description,
        location: hotel.location,
        category: hotel.category,
        price: hotel.price,
        rating: hotel.rating,
        amenities: hotel.amenities,
        imageUrl
      };
    });

    res.json({
      hotels: hotelsWithImageUrls,
      totalPages,
      currentPage: parseInt(page),
      totalCount
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 📄 Get Hotel by ID (for detail page)
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    let imageUrl = null;

    if (hotel.image) {
      if (hotel.image.$binary?.base64) {
        imageUrl = `data:image/jpeg;base64,${hotel.image.$binary.base64}`;
      } else if (hotel.image.data && Buffer.isBuffer(hotel.image.data)) {
        const base64 = hotel.image.data.toString('base64');
        const contentType = hotel.image.contentType || 'image/jpeg';
        imageUrl = `data:${contentType};base64,${base64}`;
      } else if (Buffer.isBuffer(hotel.image)) {
        const base64 = hotel.image.toString('base64');
        imageUrl = `data:image/jpeg;base64,${base64}`;
      } else if (hotel.image.buffer) {
        const base64 = hotel.image.buffer.toString('base64');
        imageUrl = `data:image/jpeg;base64,${base64}`;
      }
    }

    res.json({
      _id: hotel._id,
      name: hotel.name,
      description: hotel.description,
      location: hotel.location,
      category: hotel.category,
      price: hotel.price,
      rating: hotel.rating,
      amenities: hotel.amenities,
      imageUrl
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 📍 Get Nearby Hotels in Same District (excluding current)
exports.getNearbyHotels = async (req, res) => {
  const { district } = req.query;
  const excludeId = req.query.exclude;

  try {
    const hotels = await Hotel.find({
      'location.district': district,
      _id: { $ne: excludeId }
    }).limit(5);

    const hotelsWithImageUrls = hotels.map((hotel) => {
      let imageUrl = null;

      if (hotel.image) {
        if (hotel.image.$binary?.base64) {
          imageUrl = `data:image/jpeg;base64,${hotel.image.$binary.base64}`;
        } else if (hotel.image.data && Buffer.isBuffer(hotel.image.data)) {
          const base64 = hotel.image.data.toString('base64');
          const contentType = hotel.image.contentType || 'image/jpeg';
          imageUrl = `data:${contentType};base64,${base64}`;
        } else if (Buffer.isBuffer(hotel.image)) {
          const base64 = hotel.image.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        } else if (hotel.image.buffer) {
          const base64 = hotel.image.buffer.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        }
      }

      return {
        _id: hotel._id,
        name: hotel.name,
        location: hotel.location,
        price: hotel.price,
        rating: hotel.rating,
        imageUrl
      };
    });

    res.status(200).json({ hotels: hotelsWithImageUrls });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
