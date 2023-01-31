import { RSQLParser } from '../../entities/modules/rsqlParser';
import { TableSortOrder } from '../../entities/types';
import { getFormattedPath, getQueryParams } from '../../entities/utils';
import { ActionButton, ActionsEnum, ButtonAction, Content, DownloadFileAction } from '../../types';

interface Params {
    buttonData: ActionButton;
    selectedRowsData: Content[];
    filter?: string;
    order?: TableSortOrder;
    sort?: string;
    customFilter?: Record<string, string | boolean>;
}

export const getButtonProps = ({ buttonData, selectedRowsData, filter, order, sort, customFilter }: Params) => {
    if (buttonData?.actions && buttonData.actions[0] && buttonData.actions[0].type === ActionsEnum.DOWNLOAD_FILE) {
        const downloadActionData = buttonData.actions[0] as DownloadFileAction<Content>;
        const {
            requestOption: {
                url,
                externalPathParams,
                externalQueryParams,
                pathParamsFromRowData,
                queryParamsFromRowData,
                withFilters,
                withSort,
                getFormattedFilterQueries,
            },
        } = downloadActionData;
        let queryParams = getQueryParams({
            queryParamsFromRowData,
            externalQueryParams,
            actionsChainState: {},
            rowData: selectedRowsData,
            customFilter,
        });
        const path = getFormattedPath({
            path: url,
            externalPathParams,
            pathParamsFromRowData,
            actionsChainState: {},
            rowData: selectedRowsData,
        });

        if (getFormattedFilterQueries) {
            const formattedFilterQueries = getFormattedFilterQueries({
                formattedFilters: new RSQLParser(RSQLParser.RSQL_OPS, RSQLParser.RSQL_MAPPER).parse(filter || ''),
                ...(sort && order
                    ? {
                          sort,
                          order,
                      }
                    : {}),
            });
            queryParams = {
                ...queryParams,
                ...formattedFilterQueries,
            };
        } else {
            if (withFilters && filter) {
                queryParams = {
                    ...queryParams,
                    filter,
                    ...customFilter,
                };
            }

            if (withSort && sort && order) {
                queryParams = {
                    ...queryParams,
                    order,
                    sort,
                };
            }
        }

        const queryString = new URLSearchParams(queryParams).toString();

        const formattedHref = queryString ? `${path}?${queryString}` : path;

        return {
            as: 'a',
            href: formattedHref,
            download: true,
        };
    }

    return {};
};
