use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn version() -> String {
    String::from(env!("CARGO_PKG_VERSION"))
}

/// Number of lines in text
#[wasm_bindgen]
pub fn count_lines(text: &str) -> u32 {
    u32::try_from(text.lines().count()).unwrap_or(u32::MAX)
}

#[cfg(test)]
mod tests {

    use super::*;
    use test_case::test_case;

    #[test]
    fn returns_package_version() {
        assert_eq!(version(), "0.1.0");
    }

    #[test_case("", 0; "when text is empty")]
    #[test_case("T1: CM 6", 1; "when line does not end with a return")]
    #[test_case("a\nb\n", 2; "when text is multiple lines")]
    #[test_case("a\r\nb", 2; "when endlines are windows style")]
    #[test_case("a\n\nb", 3; "when text has an empty line")]
    fn returns_count_lines(text: &str, expected: u32) {
        assert_eq!(count_lines(text), expected);
    }
}
