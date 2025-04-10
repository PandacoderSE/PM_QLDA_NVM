package usol.group_4.ITDeviceManagement.converter;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import usol.group_4.ITDeviceManagement.DTO.response.PageResponse;

import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.List;

@Component
public class PageResponseConverter<T> {

    public PageResponse<T> mapToPageResponse(Page<T> page){
        return PageResponse.<T>builder()
                .contents(page.getContent())
                .pageSize(page.getSize())
                .first(page.isFirst())
                .last(page.isLast())
                .totalPages(page.getTotalPages())
                .isEmpty(page.isEmpty())
                .numberOfElement(page.getNumberOfElements())
                .offset(page.getPageable().getOffset())
                .page(page.getNumber())
                .totalElement(page.getTotalElements())
                .build();
    }
}
