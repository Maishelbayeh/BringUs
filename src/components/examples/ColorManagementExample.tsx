import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Divider } from '@mui/material';
import ColorManager from '../common/ColorManager';
import ProductColorsDisplay from '../common/ProductColorsDisplay';
import useProducts from '../../hooks/useProducts';

const ColorManagementExample: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productColors, setProductColors] = useState<string[][]>([]);
  const { products, fetchProducts, getProductColors } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedProduct) {
      const colors = getProductColors(selectedProduct);
      setProductColors(colors);
    }
  }, [selectedProduct, getProductColors]);

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
  };

  const handleColorsChange = (colors: string[][]) => {
    setProductColors(colors);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        مثال على إدارة ألوان المنتجات
      </Typography>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          اختر منتج لإدارة ألوانه:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {products.slice(0, 5).map((product) => (
            <Button
              key={product._id}
              variant={selectedProduct?._id === product._id ? "contained" : "outlined"}
              onClick={() => handleProductSelect(product)}
              size="small"
            >
              {product.nameAr || product.nameEn}
            </Button>
          ))}
        </Box>
      </Box>

      {selectedProduct && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {selectedProduct.nameAr || selectedProduct.nameEn}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                السعر: {selectedProduct.price} ريال
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                إدارة الألوان
              </Typography>
              
              <ColorManager
                productId={selectedProduct._id}
                currentColors={productColors}
                onColorsChange={handleColorsChange}
              />
            </CardContent>
          </Card>

          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              عرض الألوان الحالية
            </Typography>
            <ProductColorsDisplay colors={productColors} />
          </Box>
        </Box>
      )}

      {!selectedProduct && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              اختر منتج من القائمة أعلاه لإدارة ألوانه
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ColorManagementExample; 