type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type GenericTable = {
    Row: Record<string, any>;
    Insert: Record<string, any>;
    Update: Record<string, any>;
    Relationships: any[];
};

export type Database = {
    public: {
        Tables: {
            Receipt: GenericTable;
            ReceiptItem: GenericTable;
            Customer: GenericTable;
            CustomerLoyalty: GenericTable;
            Retailer: GenericTable;
            Branch: GenericTable;
            Feedback: GenericTable;
            SustainabilityStats: GenericTable;
        };
        Views: {
            [key: string]: {
                Row: any;
                Insert: any;
                Update: any;
            };
        };
        Functions: {
            [key: string]: {
                Args: any;
                Returns: any;
            };
        };
        Enums: {
            [key: string]: any;
        };
        CompositeTypes: {
            [key: string]: any;
        };
    };
};
