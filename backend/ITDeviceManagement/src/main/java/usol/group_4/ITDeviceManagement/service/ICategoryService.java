package usol.group_4.ITDeviceManagement.service;

import usol.group_4.ITDeviceManagement.DTO.request.CategoryRequest;
import usol.group_4.ITDeviceManagement.DTO.response.CategoryResponse;

import java.util.List;

public interface ICategoryService {
    public List<CategoryResponse> getAllCategory();
    public CategoryResponse addNewCategory(CategoryRequest categoryRequest);
    public CategoryResponse editCategory(CategoryRequest categoryRequest);
    public void deleteCategory(Long categoryId);
    public CategoryResponse getDetailCategory(Long categoryId);
    public List<CategoryResponse> searchByCategoryName(String categoryName);
}
