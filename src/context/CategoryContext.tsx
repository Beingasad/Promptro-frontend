import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface Category {
  id: number;
  name: string;
  image_url: string | null;
  created_at: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string, image?: File) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategory: (id: number, name: string, image?: File) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/api/categories`;

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_URL);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (name: string, image?: File) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (image) formData.append('image', image);

      await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchCategories();
    } catch (error) {
      console.error('Failed to add category', error);
      throw error;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category', error);
      throw error;
    }
  };

  const updateCategory = async (id: number, name: string, image?: File) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (image) formData.append('image', image);

      await axios.put(`${API_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category', error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, updateCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}

