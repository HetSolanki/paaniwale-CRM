import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    flexDirection: "column",
    justifyContent: "flex-start", // Start from the top
  },
  section: {
    marginBottom: 20, // Ensure enough space between sections
    padding: 10,
  },
  table: {
    display: "table",
    width: "100%", // Ensure table takes full width
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10, // Space between date and table
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    marginBottom: 5,
    fontSize: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 10,
  },
});

const ReportPDFGenarator = ({ data, columns, table_name, shop_name, logo }) => {
  const today = new Date().toLocaleDateString();
  const website_name = "http://128.199.19.208:3000/";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          {logo && <Image style={styles.logo} src={logo} />}
          <Text style={styles.title}>{table_name}</Text>
          <Text style={styles.headerText}>{shop_name}</Text>
          <Text style={styles.headerText}>Date: {today}</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {columns?.map((col) => (
              <View style={styles.tableCol} key={col.accessorKey}>
                <Text style={styles.tableCell}>{col.header}</Text>
              </View>
            ))}
          </View>
          {data?.map((customer, rowIndex) => (
            <View style={styles.tableRow} key={rowIndex}>
              {columns?.map((col) => (
                <View style={styles.tableCol} key={col.accessorKey}>
                  <Text style={styles.tableCell}>
                    {customer[col.accessorKey] !== undefined
                      ? customer[col.accessorKey].toString()
                      : ""}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text>{website_name}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDFGenarator;
