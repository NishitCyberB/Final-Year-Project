const Place = require('../models/place');

// 🔍 Search Places with Filters and Image Decoding
exports.searchPlaces = async (req, res) => {
  try {
    const { location, destinationType, ageGroup, season, page = 1, limit = 6 } = req.query;

    const filter = {};
    
    if (location) {
      filter['location.district'] = new RegExp(location, 'i');
    }
    
    if (destinationType) {
      filter.category = new RegExp(destinationType, 'i');
    }
    
    if (ageGroup) {
      filter['visitor type'] = new RegExp(ageGroup, 'i');
    }
    
    if (season) {
      filter['best season'] = new RegExp(season, 'i');
    }

    console.log('Search filter:', filter);

    const places = await Place.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCount = await Place.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const placesWithImageUrls = places.map((place) => {
      let imageUrl = null;

      if (place.image) {
        if (place.image.$binary && place.image.$binary.base64) {
          imageUrl = `data:image/jpeg;base64,${place.image.$binary.base64}`;
        } else if (place.image.data && Buffer.isBuffer(place.image.data)) {
          const base64 = place.image.data.toString('base64');
          const contentType = place.image.contentType || 'image/jpeg';
          imageUrl = `data:${contentType};base64,${base64}`;
        } else if (Buffer.isBuffer(place.image)) {
          const base64 = place.image.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        } else if (typeof place.image === 'object' && place.image.buffer) {
          const base64 = place.image.buffer.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        }
      }

      return {
        _id: place._id,
        name: place.name,
        intro: place.intro,
        details: place.details,
        location: place.location,
        category: place.category,
        'visitor type': place['visitor type'],
        'best season': place['best season'],
        price: place.price,
        rating: place.rating,
        famous: place.famous,
        imageUrl
      };
    });

    res.json({ 
      places: placesWithImageUrls, 
      totalPages,
      currentPage: parseInt(page),
      totalCount
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 📍 Get Single Place by Name
exports.getSinglePlaceByName = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const place = await Place.findOne({ name });

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    let imageUrl = null;

    if (place.image) {
      if (place.image.$binary && place.image.$binary.base64) {
        imageUrl = `data:image/jpeg;base64,${place.image.$binary.base64}`;
      } else if (place.image.data && Buffer.isBuffer(place.image.data)) {
        const base64 = place.image.data.toString('base64');
        const contentType = place.image.contentType || 'image/jpeg';
        imageUrl = `data:${contentType};base64,${base64}`;
      } else if (Buffer.isBuffer(place.image)) {
        const base64 = place.image.toString('base64');
        imageUrl = `data:image/jpeg;base64,${base64}`;
      } else if (typeof place.image === 'object' && place.image.buffer) {
        const base64 = place.image.buffer.toString('base64');
        imageUrl = `data:image/jpeg;base64,${base64}`;
      }
    }

    res.status(200).json({
      _id: place._id,
      name: place.name,
      intro: place.intro,
      details: place.details,
      location: place.location,
      category: place.category,
      'visitor type': place['visitor type'],
      'best season': place['best season'],
      price: place.price,
      rating: place.rating,
      famous: place.famous,
      imageUrl
    });

  } catch (err) {
    console.error('Get single place error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🗺️ Get Nearby Places by District (FIXED VERSION)
exports.getNearbyPlaces = async (req, res) => {
  try {
    // Get district from query parameter (not params)
    const { district, exclude } = req.query;
    
    if (!district) {
      return res.status(400).json({ error: 'District parameter is required' });
    }

    // Build query - case insensitive district search
    let query = {
      'location.district': new RegExp(district, 'i')
    };
    
    // Exclude specific place if provided
    if (exclude) {
      query.name = { $ne: exclude };
    }

    const places = await Place.find(query).limit(8);

    const placesWithImages = places.map(place => {
      let imageUrl = null;

      if (place.image) {
        if (Buffer.isBuffer(place.image)) {
          const base64 = place.image.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        } else if (place.image.buffer) {
          const base64 = place.image.buffer.toString('base64');
          imageUrl = `data:image/jpeg;base64,${base64}`;
        }
      }

      return {
        name: place.name,
        intro: place.intro,
        imageUrl
      };
    });

    // Return in format expected by frontend
    res.json({
      success: true,
      places: placesWithImages
    });

  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({ 
      error: 'Failed to fetch nearby places',
      places: []
    });
  }
};

