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
  loading: boolean;
  addCategory: (name: string, image?: File) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategory: (id: number, name: string, image?: File) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/api/categories`;

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = localStorage.getItem('promptro_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('promptro_categories');
      return !cached;
    } catch {
      return true;
    }
  });

  const fetchCategories = async () => {
    try {
      if (categories.length === 0) {
        setLoading(true);
      }
      const response = await axios.get(API_URL);
      setCategories(response.data);
      try {
        localStorage.setItem('promptro_categories', JSON.stringify(response.data));
      } catch (e) {
        console.warn('localStorage error:', e);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    window.addEventListener('online', fetchCategories);
    return () => {
      window.removeEventListener('online', fetchCategories);
    };
  }, []);

  const addCategory = async (name: string, image?: File) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (image) formData.append('image', image);

      await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
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
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
      });
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category', error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, loading, addCategory, deleteCategory, updateCategory }}>
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

