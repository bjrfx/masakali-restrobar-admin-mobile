import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  CardContent,
  Input,
  Select,
  Option,
  Chip,
  IconButton,
  Sheet,
  Skeleton,
  Button,
  Divider,
  Modal,
  ModalDialog,
  ModalClose,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  Avatar,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from '@mui/joy';
import { db } from '../../../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import TopNavbar from '../../Components/Topbar/TopNavbar';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import dayjs from 'dayjs';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    img: '',
    containsGluten: false,
    containsNuts: false,
    veg: false,
    vegan: false,
    recommended: false,
  });

  useEffect(() => {
    const menuRef = collection(db, 'menu');

    const unsubscribe = onSnapshot(menuRef, (snapshot) => {
      const menuData = [];
      
      snapshot.forEach((docSnapshot) => {
        const categoryName = docSnapshot.id;
        const categoryData = docSnapshot.data();
        
        // Handle items array
        if (categoryData.items && Array.isArray(categoryData.items)) {
          categoryData.items.forEach((item, index) => {
            menuData.push({
              id: docSnapshot.id,
              itemIndex: index,
              category: categoryName,
              ...item,
            });
          });
        }
      });

      setMenuItems(menuData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(menuItems.map(item => item.category))];
    return cats.sort();
  }, [menuItems]);

  // Filter and search logic
  const filteredMenuItems = useMemo(() => {
    let filtered = [...menuItems];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    // Tab filter
    if (selectedTab === 1) {
      filtered = filtered.filter((item) => item.veg === true);
    } else if (selectedTab === 2) {
      filtered = filtered.filter((item) => item.vegan === true);
    } else if (selectedTab === 3) {
      filtered = filtered.filter((item) => item.recommended === true);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-asc':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case 'price-desc':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'category-asc':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [menuItems, searchQuery, filterCategory, sortBy, selectedTab]);

  const handleAddItem = async () => {
    try {
      const category = formData.category || 'naan';
      const menuRef = doc(db, 'menu', category);
      
      // Get existing items and add new one
      const existingItems = menuItems
        .filter(item => item.category === category)
        .map(({ id, itemIndex, category, ...item }) => item);
      
      const newItem = {
        name: formData.name,
        description: formData.description || '',
        price: formData.price,
        img: formData.img || '',
        containsGluten: formData.containsGluten,
        containsNuts: formData.containsNuts,
        veg: formData.veg,
        vegan: formData.vegan,
        recommended: formData.recommended,
      };

      await updateDoc(menuRef, {
        items: [...existingItems, newItem],
        name: category.charAt(0).toUpperCase() + category.slice(1),
      });

      setOpenAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item. Please try again.');
    }
  };

  const handleEditItem = async () => {
    try {
      const menuRef = doc(db, 'menu', selectedItem.category);
      
      // Get all items for this category
      const categoryItems = menuItems
        .filter(item => item.category === selectedItem.category)
        .map(({ id, itemIndex, category, ...item }) => item);
      
      // Update the specific item
      categoryItems[selectedItem.itemIndex] = {
        name: formData.name,
        description: formData.description || '',
        price: formData.price,
        img: formData.img || '',
        containsGluten: formData.containsGluten,
        containsNuts: formData.containsNuts,
        veg: formData.veg,
        vegan: formData.vegan,
        recommended: formData.recommended,
      };

      await updateDoc(menuRef, {
        items: categoryItems,
      });

      setOpenEditModal(false);
      setSelectedItem(null);
      resetForm();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    }
  };

  const handleDeleteItem = async () => {
    try {
      const menuRef = doc(db, 'menu', selectedItem.category);
      
      // Get all items except the one to delete
      const categoryItems = menuItems
        .filter(item => 
          item.category === selectedItem.category && 
          item.itemIndex !== selectedItem.itemIndex
        )
        .map(({ id, itemIndex, category, ...item }) => item);

      await updateDoc(menuRef, {
        items: categoryItems,
      });

      setOpenDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      img: item.img || '',
      containsGluten: item.containsGluten || false,
      containsNuts: item.containsNuts || false,
      veg: item.veg || false,
      vegan: item.vegan || false,
      recommended: item.recommended || false,
      category: item.category || '',
    });
    setOpenEditModal(true);
  };

  const openDelete = (item) => {
    setSelectedItem(item);
    setOpenDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      img: '',
      containsGluten: false,
      containsNuts: false,
      veg: false,
      vegan: false,
      recommended: false,
      category: '',
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setSortBy('name-asc');
  };

  return (
    <Box>
      <TopNavbar />
      <Box
        sx={{
          pt: 10,
          pb: 10,
          px: 2,
          backgroundColor: 'background.level1',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography level="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Menu Management 🍽️
            </Typography>
            <Typography level="body-md" sx={{ color: 'neutral.600' }}>
              Manage your restaurant menu items
            </Typography>
          </Box>
          <Button
            color="primary"
            startDecorator={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
            size="lg"
            sx={{ flexShrink: 0 }}
          >
            Add Item
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs value={selectedTab} onChange={(e, value) => setSelectedTab(value)} sx={{ mb: 2 }}>
          <TabList>
            <Tab>All Items</Tab>
            <Tab>Vegetarian</Tab>
            <Tab>Vegan</Tab>
            <Tab>Recommended</Tab>
          </TabList>
        </Tabs>

        {/* Search and Filter */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Input
              placeholder="Search menu items..."
              startDecorator={<SearchIcon />}
              endDecorator={
                searchQuery && (
                  <IconButton size="sm" variant="plain" onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                )
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
            />
            <IconButton
              variant={showFilters ? 'solid' : 'soft'}
              color="primary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterListIcon />
            </IconButton>
          </Box>

          {showFilters && (
            <Sheet variant="soft" sx={{ p: 2, borderRadius: 'sm', mb: 2 }}>
              <Typography level="title-sm" sx={{ mb: 1.5 }}>
                Filters & Sorting
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 'md' }}>
                    Category
                  </Typography>
                  <Select
                    value={filterCategory}
                    onChange={(e, value) => setFilterCategory(value)}
                    size="sm"
                    startDecorator={<CategoryIcon />}
                  >
                    <Option value="all">All Categories</Option>
                    {categories.map((cat) => (
                      <Option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Typography level="body-sm" sx={{ mb: 0.5, fontWeight: 'md' }}>
                    Sort By
                  </Typography>
                  <Select
                    value={sortBy}
                    onChange={(e, value) => setSortBy(value)}
                    size="sm"
                    startDecorator={<SortIcon />}
                  >
                    <Option value="name-asc">Name (A-Z)</Option>
                    <Option value="name-desc">Name (Z-A)</Option>
                    <Option value="price-asc">Price (Low to High)</Option>
                    <Option value="price-desc">Price (High to Low)</Option>
                    <Option value="category-asc">Category</Option>
                  </Select>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography level="body-xs" color="neutral">
                    {filteredMenuItems.length} item{filteredMenuItems.length !== 1 ? 's' : ''}
                  </Typography>
                  <Typography
                    level="body-xs"
                    color="primary"
                    sx={{ cursor: 'pointer', fontWeight: 'md' }}
                    onClick={clearFilters}
                  >
                    Clear All
                  </Typography>
                </Box>
              </Box>
            </Sheet>
          )}
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
          <Chip color="primary" size="lg">
            Total: {menuItems.length}
          </Chip>
          <Chip color="success" size="lg">
            Veg: {menuItems.filter(i => i.veg).length}
          </Chip>
          <Chip color="warning" size="lg">
            Vegan: {menuItems.filter(i => i.vegan).length}
          </Chip>
          <Chip color="danger" size="lg">
            Categories: {categories.length}
          </Chip>
        </Box>

        {/* Menu Items Grid */}
        {loading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={200} sx={{ borderRadius: 'sm' }} />
            ))}
          </Box>
        ) : filteredMenuItems.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            {filteredMenuItems.map((item, index) => (
              <Card
                key={`${item.category}-${item.itemIndex}`}
                variant="outlined"
                sx={{
                  '&:hover': {
                    boxShadow: 'md',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Image */}
                    <Avatar
                      src={item.img}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 'sm',
                        flexShrink: 0,
                      }}
                    >
                      <RestaurantMenuIcon sx={{ fontSize: 40 }} />
                    </Avatar>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                          <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                            {item.name}
                          </Typography>
                          <Chip size="sm" variant="soft" color="neutral">
                            {item.category}
                          </Chip>
                        </Box>
                        <Typography level="h4" sx={{ color: 'primary.500', fontWeight: 'bold' }}>
                          ${item.price}
                        </Typography>
                      </Box>

                      <Typography level="body-sm" sx={{ mb: 1, color: 'neutral.600' }}>
                        {item.description || 'No description'}
                      </Typography>

                      {/* Tags */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                        {item.veg && (
                          <Chip size="sm" color="success" variant="soft">
                            🌱 Veg
                          </Chip>
                        )}
                        {item.vegan && (
                          <Chip size="sm" color="success" variant="soft">
                            🥬 Vegan
                          </Chip>
                        )}
                        {item.recommended && (
                          <Chip size="sm" color="warning" variant="soft">
                            ⭐ Recommended
                          </Chip>
                        )}
                        {item.containsGluten && (
                          <Chip size="sm" color="neutral" variant="outlined">
                            Gluten
                          </Chip>
                        )}
                        {item.containsNuts && (
                          <Chip size="sm" color="neutral" variant="outlined">
                            Nuts
                          </Chip>
                        )}
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="sm"
                          variant="soft"
                          color="primary"
                          startDecorator={<EditIcon />}
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="soft"
                          color="danger"
                          startDecorator={<DeleteIcon />}
                          onClick={() => openDelete(item)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RestaurantMenuIcon sx={{ fontSize: 64, color: 'neutral.300', mb: 2 }} />
            <Typography level="h4" sx={{ mb: 1, color: 'neutral.500' }}>
              No Menu Items Found
            </Typography>
            <Typography level="body-sm" sx={{ color: 'neutral.400', mb: 2 }}>
              {searchQuery || filterCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first menu item'}
            </Typography>
            <Button
              color="primary"
              startDecorator={<AddIcon />}
              onClick={() => setOpenAddModal(true)}
            >
              Add First Item
            </Button>
          </Box>
        )}

        {/* Add Item Modal */}
        <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
          <ModalDialog sx={{ width: '90%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              Add New Menu Item
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl required>
                <FormLabel>Item Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Butter Chicken"
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e, value) => setFormData({ ...formData, category: value })}
                  placeholder="Select category"
                >
                  {categories.map((cat) => (
                    <Option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Option>
                  ))}
                  <Option value="new">+ Create New Category</Option>
                </Select>
              </FormControl>

              {formData.category === 'new' && (
                <FormControl>
                  <FormLabel>New Category Name</FormLabel>
                  <Input
                    placeholder="e.g., appetizers"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase() })}
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your dish..."
                  minRows={2}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Price ($)</FormLabel>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  startDecorator="$"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={formData.img}
                  onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                  placeholder="https://..."
                  startDecorator={<ImageIcon />}
                />
              </FormControl>

              <Divider />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                  Properties
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Vegetarian</Typography>
                  <Switch
                    checked={formData.veg}
                    onChange={(e) => setFormData({ ...formData, veg: e.target.checked })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Vegan</Typography>
                  <Switch
                    checked={formData.vegan}
                    onChange={(e) => setFormData({ ...formData, vegan: e.target.checked })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Recommended</Typography>
                  <Switch
                    checked={formData.recommended}
                    onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Contains Gluten</Typography>
                  <Switch
                    checked={formData.containsGluten}
                    onChange={(e) => setFormData({ ...formData, containsGluten: e.target.checked })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Contains Nuts</Typography>
                  <Switch
                    checked={formData.containsNuts}
                    onChange={(e) => setFormData({ ...formData, containsNuts: e.target.checked })}
                  />
                </Box>
              </Box>

              <Button
                fullWidth
                color="primary"
                size="lg"
                startDecorator={<SaveIcon />}
                onClick={handleAddItem}
                disabled={!formData.name || !formData.price || !formData.category}
              >
                Add Item
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        {/* Edit Item Modal */}
        <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
          <ModalDialog sx={{ width: '90%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              Edit Menu Item
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl required>
                <FormLabel>Item Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  minRows={2}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Price ($)</FormLabel>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  startDecorator="$"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input
                  value={formData.img}
                  onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                  startDecorator={<ImageIcon />}
                />
              </FormControl>

              <Divider />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                  Properties
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Vegetarian</Typography>
                  <Switch
                    checked={formData.veg}
                    onChange={(e) => setFormData({ ...formData, veg: e.target.checked })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Vegan</Typography>
                  <Switch
                    checked={formData.vegan}
                    onChange={(e) => setFormData({ ...formData, vegan: e.target.checked })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Recommended</Typography>
                  <Switch
                    checked={formData.recommended}
                    onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Contains Gluten</Typography>
                  <Switch
                    checked={formData.containsGluten}
                    onChange={(e) => setFormData({ ...formData, containsGluten: e.target.checked })}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm">Contains Nuts</Typography>
                  <Switch
                    checked={formData.containsNuts}
                    onChange={(e) => setFormData({ ...formData, containsNuts: e.target.checked })}
                  />
                </Box>
              </Box>

              <Button
                fullWidth
                color="primary"
                size="lg"
                startDecorator={<SaveIcon />}
                onClick={handleEditItem}
              >
                Save Changes
              </Button>
            </Box>
          </ModalDialog>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
          <ModalDialog variant="outlined" role="alertdialog">
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              Delete Menu Item?
            </Typography>
            <Typography level="body-md" sx={{ mb: 3 }}>
              Are you sure you want to delete <strong>{selectedItem?.name}</strong>? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="plain" color="neutral" onClick={() => setOpenDeleteModal(false)}>
                Cancel
              </Button>
              <Button color="danger" onClick={handleDeleteItem}>
                Delete
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </Box>
    </Box>
  );
};

export default Menu;